use futures::Stream;
use std::pin::Pin;
use std::process::Stdio;
use std::task::{Context, Poll};
use std::time::Duration;
use tokio::io::{AsyncBufReadExt, AsyncRead, AsyncWriteExt, BufReader, ReadBuf};
use tokio::process::Command;
use tokio::time::timeout;

const SIZE_LIMIT: usize = 256 * 1024; // 256 Kio

pub(crate) async fn runner(code: String) -> impl Stream<Item = Option<String>> {
    async_stream::stream! {
        let mut child = Command::new("prlimit")
            .args([
                "--rss=4194304", // 4MB
                "bwrap",
                "--ro-bind",
                "/usr",
                "/usr",
                "--dir",
                "/tmp",
                "--dir",
                "/var",
                "--proc",
                "/proc",
                "--dev",
                "/dev",
                "--symlink",
                "usr/lib",
                "/lib",
                "--symlink",
                "usr/lib64",
                "/lib64",
                "--symlink",
                "usr/bin",
                "/bin",
                "--symlink",
                "usr/sbin",
                "/sbin",
                "--unshare-all",
                "--die-with-parent",
                "/bin/env",
                "moshell",
            ])
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .expect("Failed to spawn command");
        let sleep = tokio::time::sleep(Duration::from_secs(5));
        tokio::pin!(sleep);
        let mut stdin = child.stdin.take().unwrap();
        stdin.write_all(code.as_bytes()).await.unwrap();
        drop(stdin);

        let mut stdout = BufReader::new(TakeBytes::new(child.stdout.take().unwrap(), SIZE_LIMIT)).lines();
        let mut stderr = BufReader::new(TakeBytes::new(child.stderr.take().unwrap(), SIZE_LIMIT)).lines();
        // Redirect stdout and stderr to the SSE stream
        loop {
            tokio::select! {
                line = stdout.next_line() => {
                    if let Ok(Some(line)) = line {
                        yield Some(line);
                    } else {
                        break;
                    }
                }
                line = stderr.next_line() => {
                    if let Ok(Some(line)) = line {
                        yield Some(line);
                    } else {
                        break;
                    }
                }
                _ = &mut sleep => {
                    yield Some("Timeout".to_owned());
                    break;
                }
            }
        }
        match timeout(Duration::from_secs(1), child.wait()).await {
            Ok(Ok(status)) => yield Some(format!("Exited with status: {}", status.code().unwrap_or(-1))),
            Ok(Err(_)) => {},
            Err(_) => {
                child.kill().await.unwrap();
            }
        };
        yield None;
    }
}

struct TakeBytes<S: AsyncRead> {
    inner: S,
    seen: usize,
    limit: usize,
}

impl<S: AsyncRead> TakeBytes<S> {
    fn new(inner: S, limit: usize) -> Self {
        Self {
            inner,
            seen: 0,
            limit,
        }
    }
}

impl<S: AsyncRead + Unpin> AsyncRead for TakeBytes<S> {
    fn poll_read(
        mut self: Pin<&mut Self>,
        cx: &mut Context<'_>,
        buf: &mut ReadBuf<'_>,
    ) -> Poll<std::io::Result<()>> {
        if self.seen >= self.limit {
            return Poll::Ready(Ok(()));
        }
        let poll = Pin::new(&mut self.inner).poll_read(cx, buf);
        if let Poll::Ready(Ok(())) = poll {
            self.seen += buf.filled().len();
        }
        poll
    }
}

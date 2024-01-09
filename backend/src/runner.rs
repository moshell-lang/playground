use futures::Stream;
use std::pin::Pin;
use std::process::Stdio;
use std::task::{Context, Poll};
use std::time::Duration;
use tokio::io::{AsyncBufReadExt, AsyncRead, BufReader, ReadBuf};
use tokio::process::Command;

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
                "-c",
                &code
            ])
            .kill_on_drop(true)
            .env_clear()
            .env("CLICOLOR_FORCE", "1")
            .stdin(Stdio::null())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .expect("Failed to spawn command");
        let sleep = tokio::time::sleep(Duration::from_secs(5));
        tokio::pin!(sleep);

        let mut stdout = BufReader::new(TakeBytes::new(child.stdout.take().unwrap(), SIZE_LIMIT)).lines();
        let mut stderr = BufReader::new(TakeBytes::new(child.stderr.take().unwrap(), SIZE_LIMIT)).lines();
        // Redirect stdout and stderr to the SSE stream
        loop {
            tokio::select! {
                line = stdout.next_line() => {
                    match line {
                        Ok(Some(line)) => yield Some(line),
                        Ok(None) => {},
                        Err(_) => break,
                    }
                }
                line = stderr.next_line() => {
                    match line {
                        Ok(Some(line)) => yield Some(line),
                        Ok(None) => {},
                        Err(_) => break,
                    }
                }
                status = child.wait() => {
                    if let Ok(status) = status {
                        yield Some(format!("Exited with status: {}", status.code().unwrap_or(-1)));
                    } else {
                        yield Some("Exited with error".to_owned());
                    }
                    break;
                }
                _ = &mut sleep => {
                    child.kill().await.unwrap();
                    yield Some("Timeout".to_owned());
                    break;
                }
            }
        }
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
            return Poll::Ready(Err(std::io::Error::new(
                std::io::ErrorKind::Other, // Switch to FileTooLarge when stabilized
                "Size limit exceeded",
            )));
        }
        let poll = Pin::new(&mut self.inner).poll_read(cx, buf);
        if let Poll::Ready(Ok(())) = poll {
            self.seen += buf.filled().len();
        }
        poll
    }
}

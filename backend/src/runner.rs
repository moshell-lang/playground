use futures::Stream;
use std::process::Stdio;
use std::time::Duration;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::process::Command;
use tokio::time::timeout;

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

        let mut stdout = BufReader::new(child.stdout.take().unwrap()).lines();
        let mut stderr = BufReader::new(child.stderr.take().unwrap()).lines();
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

mod runner;

use axum::{
    extract,
    response::sse::{Event, Sse},
    routing::post,
    Router,
};
use futures::{Stream, StreamExt};
use http::{HeaderValue, Method};
use serde::Deserialize;
use std::convert::Infallible;
use std::error::Error;
use tokio::net::TcpListener;
use tower_http::cors::{Any, CorsLayer};

#[derive(Deserialize)]
struct RunCode {
    version: RunVersion,
    code: String,
}

#[derive(Deserialize, PartialEq, Eq, Copy, Clone, Debug)]
enum RunVersion {
    #[serde(rename = "latest")]
    Latest,
}

async fn run_code(
    extract::Json(payload): extract::Json<RunCode>,
) -> Sse<impl Stream<Item = Result<Event, Infallible>>> {
    assert_eq!(payload.version, RunVersion::Latest); // The only one that exists
    let stream = runner::runner(payload.code)
        .await
        .map(|line: Option<String>| {
            Ok({
                let event = Event::default();
                if let Some(line) = line {
                    event.data(line)
                } else {
                    event.id("end")
                }
            })
        });
    Sse::new(stream)
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let cors = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST])
        .allow_headers(Any)
        .allow_origin(
            option_env!("ALLOW_ORIGIN")
                .unwrap_or("http://localhost:5173")
                .parse::<HeaderValue>()
                .unwrap(),
        );
    let app = Router::new().route("/run", post(run_code)).layer(cors);

    let listener = TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
    Ok(())
}

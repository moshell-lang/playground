mod runner;

use axum::{
    extract,
    response::sse::{Event, Sse},
    routing::post,
    Router,
};
use futures::{Stream, StreamExt};
use serde::Deserialize;
use std::convert::Infallible;
use std::error::Error;

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
        .map(|line: String| Ok(Event::default().data(line)));
    Sse::new(stream)
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let app = Router::new().route("/run", post(run_code));

    axum::Server::bind(&"0.0.0.0:3000".parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
    Ok(())
}

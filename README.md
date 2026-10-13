# cc-stream-cribl-edge-host-metrics

Restores native Cribl metric publication for Edge host metrics forwarded over S2S as JSON.

## Pipeline

`edge_s2s_metrics_to_splunk` preserves existing `sourcetype` values and defaults missing values to `edge:metrics`. It publishes `_metric`/`_value`
events and top-level `node_*` and `gpu_*` fields as gauges with only the `host` dimension. `_value` is converted to a number only for events that have
`_metric`.

The `splunk_metrics_index` Pack variable sets the Splunk metrics index. Its default is `host_metrics`.

## Integration

This pack contains processing logic. The consuming deployment routes events into the pipeline and binds the destination.

## Development

Use `bun run lint`, `bun run typecheck`, and `bun run test` for checks. Use `make build` to produce the `.crbl` artifact.

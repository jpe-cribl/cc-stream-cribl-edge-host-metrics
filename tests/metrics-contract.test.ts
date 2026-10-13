import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, it } from "vitest";
import { parse as yamlParse } from "yaml";
import { PACK_ROOT } from "./cribl-client.js";

interface Pipeline {
  functions?: {
    id: string;
    filter?: string;
    conf?: Record<string, unknown>;
  }[];
}

it("publishes keyed metrics and bounded node/GPU field metrics", () => {
  const pipeline = yamlParse(
    readFileSync(
      join(
        PACK_ROOT,
        "default",
        "pipelines",
        "edge_s2s_metrics_to_splunk",
        "conf.yml",
      ),
      "utf8",
    ),
  ) as Pipeline;
  const publishers = (pipeline.functions ?? []).filter(
    (fn) => fn.id === "publish_metrics",
  );

  expect(publishers).toHaveLength(2);
  expect(
    publishers.find((fn) => fn.filter === "_metric !== undefined")?.conf,
  ).toMatchObject({
    metricNameField: "_metric",
    valueField: "_value",
    dimensions: ["host"],
  });
  expect(
    publishers.find((fn) => fn.filter === "_metric === undefined")?.conf,
  ).toMatchObject({
    dimensions: ["host"],
    fields: [
      { inFieldName: "node_*", metricType: "gauge" },
      { inFieldName: "gpu_*", metricType: "gauge" },
    ],
  });
});

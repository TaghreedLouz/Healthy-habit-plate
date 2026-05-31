import { writeFileSync } from "node:fs";

// publish = "dist" → built assets live under /client/assets/* on disk
const rules = `/assets/* /client/assets/:splat 200
/* /.netlify/functions/server 200
`;

writeFileSync("dist/_redirects", rules);
writeFileSync("dist/client/_redirects", rules);

import esbuild, { BuildOptions } from "esbuild"
import esbuildPluginPino from "esbuild-plugin-pino"

const config: BuildOptions = {
  entryPoints: ['./src/index.ts'],
  bundle: true,
  platform: "node",
  outdir: 'dist',
  sourcemap: true,
  plugins: [esbuildPluginPino({ transports: [] })]
}

if (process.argv.at(2) == "watch") {
  const ctx = await esbuild.context(config)
  await ctx.watch()
}
else {
  await esbuild.build(config)
}

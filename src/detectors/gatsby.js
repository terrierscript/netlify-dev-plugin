const { existsSync, readFileSync } = require('fs')

module.exports = function() {
  if (!existsSync('gatsby-config.js') || !existsSync('package.json')) {
    return false
  }

  const packageSettings = JSON.parse(readFileSync('package.json', { encoding: 'utf8' }))
  const { dependencies, scripts } = packageSettings
  if (!(dependencies && dependencies['gatsby'])) {
    return false
  }

  const npmCommand = scripts && ((scripts.develop && 'develop') || (scripts.dev && 'dev'))
  if (!npmCommand) {
    // search all the scripts for something that starts with 'gatsby develop'
    Object.entries(scripts).forEach(([k, v]) => {
      if (v.startsWith('gatsby develop')) {
        npmCommand = k
      }
    })
    if (!npmCommand) {
      console.error("Couldn't determine the package.json script to run for this Gatsby project. Use the -c flag.")
      process.exit(1)
    } else {
      console.log('using npm script starting with gatsby develop: ', k)
    }
  }

  console.log({ npmCommand, scripts })
  const yarnExists = existsSync('yarn.lock')
  return {
    command: yarnExists ? 'yarn' : 'npm',
    port: 8888,
    proxyPort: 8000,
    env: { ...process.env },
    args: yarnExists || npmCommand != 'start' ? ['run', npmCommand] : [npmCommand],
    urlRegexp: new RegExp(`(http://)([^:]+:)${8000}(/)?`, 'g'),
    dist: 'public'
  }
}

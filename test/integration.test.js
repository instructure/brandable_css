const path = require('path')
const fsX = require('fs-extra-promise')
const { assert } = require('chai')
const css = require('css')

describe('brandable_css', () => {
  const dist = path.resolve(__dirname, '../tmp/dist')

  before(async () => {
    process.env.BRANDABLE_CSS_CONFIG_FILE = path.resolve(__dirname, 'fixture/config/brandable_css.yml')

    const { checkAll } = require('../src/main')

    await fsX.emptyDir(dist)
    await checkAll()
  })

  after(async () => {
    await fsX.emptyDir(dist)
    process.env.BRANDABLE_CSS_CONFIG_FILE = undefined
  })

  it('generates the manifest', async () => {
    const manifest = JSON.parse(
      fsX.readFileSync(
        path.resolve(dist, 'bundles_with_deps.json'),
        'utf8'
      )
    )

    assert.deepEqual(manifest, {
      "a.scss$$$$$$$$$$$normal_contrast": {
        "combinedChecksum": "542ecd8ef1",
        "includedFiles": [
          "a.scss"
        ],
        "includesNoVariables": true
      },
      "a.scss$$$$$$$$$$$high_contrast": {
        "combinedChecksum": "542ecd8ef1",
        "includedFiles": [
          "a.scss"
        ],
        "includesNoVariables": true
      },
      "b.scss$$$$$$$$$$$normal_contrast": {
        "combinedChecksum": "c9f94e5d5e",
        "includedFiles": [
          "b.scss",
          "variants/normal_contrast/_variant_variables.scss"
        ],
        "includesNoVariables": false
      },
      "b.scss$$$$$$$$$$$high_contrast": {
        "combinedChecksum": "266ca318ab",
        "includedFiles": [
          "b.scss",
          "variants/high_contrast/_variant_variables.scss"
        ],
        "includesNoVariables": false
      }
    })
  })

  it('generates variant stylesheets for files that use variables', () => {
    assert.ok(fsX.existsSync(path.resolve(dist, 'high_contrast/b-266ca318ab.css')))
    assert.ok(fsX.existsSync(path.resolve(dist, 'normal_contrast/b-c9f94e5d5e.css')))
  })

  it('variants as "no_variables" for files that use no variables', () => {
    assert.ok(fsX.existsSync(path.resolve(dist, 'no_variables/a-542ecd8ef1.css')))
  })

  it('applies variant variables', () => {
    const samples = [
      { file: 'high_contrast/b-266ca318ab.css', color: 'maroon' },
      { file: 'normal_contrast/b-c9f94e5d5e.css', color: 'red' },
    ]

    for (const sample of samples) {
      const file = fsX.readFileSync(path.resolve(dist, sample.file), 'utf8')
      const {stylesheet} = css.parse(file)

      assert.deepEqual(stylesheet.rules[0].selectors, ['body'])
      assert.deepEqual(stylesheet.rules[0].declarations.length, 1)
      assert.include(stylesheet.rules[0].declarations[0], {
        property: 'background',
        value: sample.color
      })
    }
  })
})

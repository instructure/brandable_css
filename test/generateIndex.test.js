const subject = require('../src/generateIndex')
const { assert } = require('chai')
const contriveId = require('../src/contriveId')

describe('generateIndex', () => {
  it("processes only the bundles that start with jst/", () => {
    const [variants, checksums] = subject({
      pattern: 'jst/**',
      combinedChecksums: {
        "bundles/account_admin_tools.scss$$$$$$$$$$$new_styles_high_contrast": {
          "combinedChecksum": "f11ca29695",
          "includesNoVariables": false
        },
        "jst/courses/Syllabus.scss$$$$$$$$$$$responsive_layout_normal_contrast": {
          "combinedChecksum": "39352b56d7",
          "includesNoVariables": false
        }
      }
    })

    assert.equal(Object.keys(checksums).length, 1)
  })

  it("assigns a contrived id to a template", () => {
    const [variants, checksums] = subject({
      pattern: 'jst/**',
      manifestKeySeperator: '$$$$$$$$$$$',
      combinedChecksums: {
        "jst/courses/Syllabus.scss$$$$$$$$$$$responsive_layout_normal_contrast": {
          "combinedChecksum": "39352b56d7",
          "includesNoVariables": false
        }
      }
    })

    assert.deepEqual(Object.keys(checksums), [contriveId('jst/courses/Syllabus')])
  })

  it("tracks the variants it sees", () => {
    const [variants, checksums] = subject({
      pattern: '**',
      manifestKeySeperator: '$$$$$$$$$$$',
      combinedChecksums: {
        "jst/courses/Syllabus.scss$$$$$$$$$$$first": {
          "combinedChecksum": "39352b56d7",
          "includesNoVariables": false
        },
        "jst/courses/Syllabus.scss$$$$$$$$$$$second": {
          "combinedChecksum": "39352b56d7",
          "includesNoVariables": false
        },
        "jst/courses/Syllabus.scss$$$$$$$$$$$third": {
          "combinedChecksum": "39352b56d7",
          "includesNoVariables": false
        },
      }
    })

    assert.deepEqual(variants, [ 'first', 'second', 'third' ])
  })

  it("uses a numeric index instead of the checksum if it's been seen before", () => {
    const [variants, checksums] = subject({
      pattern: '**',
      manifestKeySeperator: '$$$$$$$$$$$',
      combinedChecksums: {
        "jst/courses/Syllabus.scss$$$$$$$$$$$first": {
          "combinedChecksum": "xxx",
          "includesNoVariables": false
        },
        "jst/courses/Syllabus.scss$$$$$$$$$$$second": {
          "combinedChecksum": "xxx",
          "includesNoVariables": false
        },
        "jst/courses/Syllabus.scss$$$$$$$$$$$third": {
          "combinedChecksum": "yyy",
          "includesNoVariables": false
        },
        "jst/courses/Syllabus.scss$$$$$$$$$$$fourth": {
          "combinedChecksum": "yyy",
          "includesNoVariables": false
        },
      }
    })

    const id = contriveId('jst/courses/Syllabus')

    assert.deepEqual(checksums[id], ['xxx', 0, 'yyy', 2])
  })

  it("includes only one checksum for templates that use no variables", () => {
    const [variants, checksums] = subject({
      pattern: '**',
      manifestKeySeperator: '$$$$$$$$$$$',
      combinedChecksums: {
        "jst/courses/Syllabus.scss$$$$$$$$$$$first": {
          "combinedChecksum": "xxx",
          "includesNoVariables": true
        },
        "jst/courses/Syllabus.scss$$$$$$$$$$$second": {
          "combinedChecksum": "xxx",
          "includesNoVariables": true
        }
      }
    })

    const id = contriveId('jst/courses/Syllabus')

    assert.deepEqual(checksums[id], ['xxx'])
  })

  it("bails if it finds a collision", () => {
    assert.throws(() => {
      subject({
        pattern: '**',
        manifestKeySeperator: '$$$$$$$$$$$',
        keysz: 1,
        combinedChecksums: {
          "bah$$$$$$$$$$$first": {
            "combinedChecksum": "xxx",
            "includesNoVariables": true
          },
          "gz$$$$$$$$$$$first": {
            "combinedChecksum": "xxx",
            "includesNoVariables": true
          }
        }
      })
    }, 'bundle "gz" collides with "bah" at id "c"')
  })
})
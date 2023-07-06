const t = require('tap')
const { Minipass } = require('../')

t.test('removing last data listener stops data flow', t => {
  const s = new Minipass()
  t.equal(s.flowing, false)
  const h = () => {}
  s.on('data', h)
  t.equal(s.flowing, true)
  s.off('data', h)
  t.equal(s.flowing, false)
  s.on('data', h)
  t.equal(s.flowing, true)
  s.removeAllListeners('data')
  t.equal(s.flowing, false)
  s.on('data', h)
  t.equal(s.flowing, true)
  s.removeAllListeners()
  t.equal(s.flowing, false)
  t.end()
})

t.test('discarding works, undiscards on pipe or listener', t => {
  const s = new Minipass()
  s.resume()
  t.equal(s.flowing, true)
  s.pause()
  t.equal(s.flowing, false)
  s.resume()
  t.equal(s.flowing, true)
  const d = new Minipass()
  s.pipe(d)
  t.equal(s.flowing, true)
  t.equal(s.write('x'), false)
  t.equal(s.flowing, false)
  s.unpipe(d)
  t.equal(s.flowing, false)
  s.resume()
  t.equal(s.flowing, true)
  s.on('data', () => {})
  t.equal(s.flowing, true)
  s.resume()
  s.removeAllListeners('data')
  t.equal(s.flowing, false)
  t.end()
})

t.test('unpipe triggers a stop to the flow if it was the only dest', t => {
  const src = new Minipass({ encoding: 'utf8' })
  const dest = new Minipass({ encoding: 'utf8' })
  dest.resume()
  src.write('hello')
  t.equal(src.flowing, false)
  src.pipe(dest)
  t.equal(src.flowing, true)
  t.equal(src.read(), null)
  src.unpipe(dest)
  t.equal(src.flowing, false)
  src.write('second write')
  t.equal(src.read(), 'second write')
  t.end()
})

t.test('flowing continues if there is a data listener', t => {
  const src = new Minipass({ encoding: 'utf8' })
  const dest = new Minipass({ encoding: 'utf8' })
  const d = []
  src.on('data', c => d.push(c))
  dest.resume()
  src.write('hello')
  t.equal(src.flowing, true)
  src.pipe(dest)
  t.equal(src.flowing, true)
  t.equal(src.read(), null)
  src.unpipe(dest)
  t.equal(src.flowing, true)
  src.write('second write')
  t.equal(src.read(), null)
  t.strictSame(d, ['hello', 'second write'])
  t.end()
})

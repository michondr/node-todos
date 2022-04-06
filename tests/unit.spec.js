import test from 'ava';

test('true is true', (t) => {
  t.is(true, true)
})

test('is empty', (t) => {
  t.assert([].length === 0, 'n§ot')
})

test('are objects same', (t) => {
  t.deepEqual({a:1}, {a:1})
})

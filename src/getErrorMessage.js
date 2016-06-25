export default (err) => {
  if (process.env.NODE_ENV === 'production') {
    return err.message || err
  }
  return err.stack || err.message || err
}

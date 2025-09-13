export const ok = (res, data = null, status = 200) => res.status(status).json({ ok: true, data })
export const fail = (res, code='INTERNAL_ERROR', message='Internal Error', status=500) =>
  res.status(status).json({ ok: false, error: { code, message } })

export async function paginate (model, query = {}, opts = {}) {
  const page = Math.max(1, parseInt(opts.page ?? 1, 10))
  const limit = Math.max(1, Math.min(100, parseInt(opts.limit ?? 25, 10)))
  const sort = opts.sort ?? { createdAt: -1 }
  const [items, total] = await Promise.all([
    model.find(query).sort(sort).skip((page - 1) * limit).limit(limit),
    model.countDocuments(query)
  ])
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) }
}

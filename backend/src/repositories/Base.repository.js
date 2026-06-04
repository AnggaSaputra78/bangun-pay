class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    const document = new this.model(data);
    return await document.save();
  }

  async findById(id) {
    return await this.model.findById(id).where({ deletedAt: null });
  }

  async findOne(filter) {
    return await this.model.findOne({ ...filter, deletedAt: null });
  }

  async find(filter = {}, options = {}) {
    const { page = 1, limit = 10, sort = '-createdAt', select = '' } = options;
    const skip = (page - 1) * limit;

    const query = this.model
      .find({ ...filter, deletedAt: null })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    if (select) {
      query.select(select);
    }

    const [documents, total] = await Promise.all([
      query.exec(),
      this.model.countDocuments({ ...filter, deletedAt: null }),
    ]);

    return {
      documents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async update(id, data) {
    return await this.model.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
  }

  async delete(id) {
    return await this.model.findByIdAndUpdate(id, {
      deletedAt: new Date(),
    });
  }

  async hardDelete(id) {
    return await this.model.findByIdAndDelete(id);
  }

  async count(filter = {}) {
    return await this.model.countDocuments({ ...filter, deletedAt: null });
  }
}

export default BaseRepository;
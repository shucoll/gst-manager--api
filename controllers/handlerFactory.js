import catchAsync from '../utils/catchAsync.js';

export const getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const queryObj = { ...req.query };

    //filter
    const filterObj = { ...queryObj };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'ids', 'q'];
    excludedFields.forEach((el) => delete filterObj[el]);

    //sort
    let sortOrder;
    if (queryObj.sort) {
      if (queryObj.sort.startsWith('-')) {
        sortOrder = 'DESC';
        queryObj.sort = queryObj.sort.substring(1);
      } else sortOrder = 'ASC';
    } else {
      queryObj.sort = 'id';
      sortOrder = 'DESC';
    }

    //limitFields
    let attributes = { exclude: [] };
    if (queryObj.fields) {
      attributes = queryObj.fields.split(',');
    }

    //paginate
    const page = queryObj.page * 1 || 1;
    const limit = queryObj.limit * 1 || 100;
    const skip = (page - 1) * limit;

    let includeObj;

    const whereObj = {
      where: { ...filterObj },
    };

    //total doc with filters
    const totalDocLength = await Model.count({
      ...whereObj,
    });

    const doc = await Model.findAll({
      attributes: attributes,
      ...whereObj,
      order: [[`${queryObj.sort}`, `${sortOrder}`]],
      offset: skip,
      limit: limit,
      ...includeObj,
    });

    res.status(200).json({
      status: 'success',
      totalResults: totalDocLength,
      results: doc.length,
      data: doc,
    });
  });

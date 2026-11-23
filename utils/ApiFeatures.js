class ApiFeatures {

    constructor (query,queryStr) {
        this.query = query 
        this.queryStr = queryStr 
        this.filterQuery = {}
        this.searchQuery = {}
    }

    filter() {
        let queryObj = {...this.queryStr}
        const exclusiveFields = ['sort','search','fields','page','limit','skip']
        exclusiveFields.forEach(f => delete queryObj[f])
        let queryString = JSON.stringify(queryObj).replace(/\b(gt|gte|lt|lte)\b/g , match => `$${match}`)
        queryObj = JSON.parse(queryString)
        this.filterQuery = queryObj 
        this.query = this.query.find(queryObj)
        return this
    }

    search () {
        if (this.queryStr.search) {
            let keyword = this.queryStr.search;
            const searchQuery = {$or : [
                {name : {$regex : `^${keyword}`,$options : "i"}},
                {description : {$regex : `${keyword}`,$options : "i"}},
            ]}
            this.searchQuery = searchQuery
            this.query = this.query.find(searchQuery)
        }
        return this
    }

    sort () {
        if (this.queryStr.sort) {
            const sortBy = this.queryStr.sort.replaceAll("," , " ")
            this.query = this.query.sort(sortBy)
        }else {
            this.query = this.query.sort("-createdAt")
        }
        return this
    }

    fields () {
         if (this.queryStr.fields) {
            const fields = this.queryStr.fields.replaceAll("," , " ")
            this.query = this.query.select(fields)
        }else {
            this.query = this.query.select("-__v")
        }
        return this
    }

    pagination () {
        let page = Number(this.queryStr.page) || 1
        let limit = Number(this.queryStr.limit) || 10
        let skip = (page - 1) * limit
        this.query = this.query.skip(skip).limit(limit)
        return this
    }
}


module.exports = ApiFeatures

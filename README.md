<p align='center'>
  <img src='https://cloud.githubusercontent.com/assets/425716/12668376/cc4011ca-c60a-11e5-89f6-0759db74079b.png' width='400'/>
  <p align='center'>Build next-generation realtime APIs simply and easily</p>
</p>

## Install

One command and you're ready to make some killer APIs:
```
npm install sutro --save
```

**Now**, check out the [documentation](https://github.com/contra/sutro/tree/master/docs) to get started!


## Examples

### 10-LOC ES7 API

```js
const api = {
  user: {
    create: async ({ data }) => User.create(data),
    find: async ({ options }) => User.findAll(options),
    findById: async ({ userId }) => User.findById(userId),
    updateById: async ({ userId, data }) => User.updateById(userId, data),
    replaceById: async ({ userId, data }) => User.replaceById(userId, data),
    deleteById: async ({ userId }) => User.deleteById(userId)
  }
}
```

Yields:

```
GET /swagger.json
GET /users
POST /users
GET /users/:userId
PATCH /users/:userId
PUT /users/:userId
DELETE /users/:userId
```

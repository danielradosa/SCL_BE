# SCL_BE
### Installation & Development

- Installation : `npm install` or `npm i`  (if you get ERESOLVE error just add this `--legacy-peer-deps`)<br />
- Development : `nodemon app` for development

#### Tech-Stack
1. GraphQL
2. Mongoose
3. Express
4. Node

#### Currently working
1. User endpoints:
    - getUserById `query`
    - getAllUsers `query`
    - registerUser `mutation`
2. Post endpoints:
    - getPostById `query`
    - getAllPosts `query`
    - createPost `mutation`
3. Bio endpoints:
    - getBioByUserId `query`
    - createBio `mutation`

module.exports = {
    HOST: process.env.HOST || 'localhost',
    USER: 'root',
    PASSWORD: process.env.PASSWORD || 'Urvashi@1802',
    DB: process.env.DB || 'webapp',
    PORT: 3306,
    dialect: 'mysql',
    pool:{
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};
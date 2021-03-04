module.exports = {
    HOST: process.env.db_instance_hostname || 'localhost',
    USER: process.env.db_instance_username || 'root',
    PASSWORD: process.env.db_instance_password || 'Urvashi@1802',
    DB: process.env.db_instance_name || 'webapp',
    PORT: 3306,
    dialect: 'mysql',
    pool:{
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    AWS_BUCKET_NAME: process.env.s3_bucket_name,
    AWS_ACCESS_KEY_ID : process.env.aws_access_key_id,
    AWS_SECRET_ACCESS_KEY : process.env.aws_secret_key_id,
    aws_region : process.env.aws_region || "us-east-1",
};
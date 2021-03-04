module.exports = (sequelize, Sequelize) => {
    const Image = sequelize.define("image", {
        file_id: {
            type: Sequelize.UUID,
            primaryKey: true,
            noUpdate: true
        },
        file_name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        s3_object_name: {
            type: Sequelize.STRING,
            allowNull: false
        },
    });

    return Image;
}
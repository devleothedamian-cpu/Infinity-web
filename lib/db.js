import mongoose from 'mongoose'
import chalk from 'chalk'

const MONGO_URI = 'mongodb+srv://kobdany56_db_user:559911starlyn@infinitybot.gxbqqzr.mongodb.net/?retryWrites=true&w=majority'

const userSchema = new mongoose.Schema({
    number: {
        type: String,
        required: true,
        unique: true
    },
    pushName: {
        type: String,
        default: 'Usuario'
    },
    genero: {
        type: String,
        default: 'undefined'
    },
    edad: {
        type: String,
        default: 'undefined'
    },
    desc: {
        type: String,
        default: 'sin descripcion'
    },
    birthday: {
        type: String,
        default: 'no establecido'
    },
    packname: {
        type: String,
        default: '𝖬𝖺𝖽𝖾 𝖡𝗒 𝖲𝗍𝖺𝗋𝗅𝗒𝗇'
    },
    author: {
        type: String,
        default: '𝖨𝗇𝖿𝗂𝗇𝗂𝗍𝗒 𝖡𝗈𝗍'
    },
    commands: {
        type: Number,
        default: 0
    },
    exp: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 0
    },
    rango: {
        type: String,
        default: 'Usuario'
    },
    ban: {
        type: Boolean,
        default: false
    },
    lastCommandAt: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const User = mongoose.model('User', userSchema)

async function connectDB() {
    try {
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 20
        })
        console.log(chalk.green('✅ MongoDB conectado correctamente'))
        console.log(chalk.gray(`📁 Base de datos: infinityBot`))
        console.log(chalk.gray(`👤 Usuario: kobdany56_db_user`))
    } catch (err) {
        console.log(chalk.red('❌ Error conectando MongoDB:'), err.message)
        process.exit(1)
    }
}

async function getUser(number) {
    try {
        let user = await User.findOne({ number })
        if (!user) {
            user = new User({
                number,
                pushName: 'Usuario',
                genero: 'undefined',
                edad: 'undefined',
                desc: 'sin descripcion',
                birthday: 'no establecido',
                packname: '𝖬𝖺𝖽𝖾 𝖡𝗒 𝖲𝗍𝖺𝗋𝗅𝗒𝗇',
                author: '𝖨𝗇𝖿𝗂𝗇𝗂𝗍𝗒 𝖡𝗈𝗍',
                commands: 0,
                exp: 0,
                level: 0,
                rango: 'Usuario',
                ban: false
            })
            await user.save()
            console.log(chalk.green(`📝 Nuevo usuario registrado: ${number}`))
        }
        return user
    } catch (err) {
        console.log(chalk.red('Error obteniendo usuario:'), err.message)
        return null
    }
}

async function updateUser(number, data) {
    try {
        const user = await User.findOne({ number })
        if (!user) return null
        
        Object.keys(data).forEach(key => {
            if (data[key] !== undefined && key !== 'number') {
                user[key] = data[key]
            }
        })
        
        await user.save()
        return user
    } catch (err) {
        console.log(chalk.red('Error actualizando usuario:'), err.message)
        return null
    }
}

async function addExp(number, amount) {
    try {
        const user = await User.findOne({ number })
        if (!user) return null
        
        user.exp += amount
        
        const expForLevel = (level) => Math.floor(250 + (level * 50))
        let expNeeded = expForLevel(user.level)
        
        while (user.exp >= expNeeded) {
            user.exp -= expNeeded
            user.level += 1
            expNeeded = expForLevel(user.level)
        }
        
        if (user.level >= 10) user.rango = 'Veterano'
        else if (user.level >= 5) user.rango = 'Experto'
        else if (user.level >= 3) user.rango = 'Aprendiz'
        else user.rango = 'Usuario'
        
        await user.save()
        return user
    } catch (err) {
        console.log(chalk.red('Error agregando exp:'), err.message)
        return null
    }
}

async function getTopUsers(limit = 10) {
    try {
        return await User.find()
            .sort({ level: -1, exp: -1 })
            .limit(limit)
            .select('number pushName level exp rango')
    } catch (err) {
        console.log(chalk.red('Error obteniendo top usuarios:'), err.message)
        return []
    }
}

async function getAllUsers() {
    try {
        return await User.find().select('number pushName level exp rango ban commands')
    } catch (err) {
        console.log(chalk.red('Error obteniendo usuarios:'), err.message)
        return []
    }
}

async function banUser(number) {
    return await updateUser(number, { ban: true })
}

async function unbanUser(number) {
    return await updateUser(number, { ban: false })
}

export {
    connectDB,
    User,
    getUser,
    updateUser,
    addExp,
    getTopUsers,
    getAllUsers,
    banUser,
    unbanUser
}

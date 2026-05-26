import 'dotenv/config'
import app from './src/app.js'
import connectDB from './src/common/config/db.js'
import validateEnv, { getEmailTransportMode } from './src/common/config/validate-env.js'
import { ensureDemoClient } from './src/modules/oauth/oauth.service.js'

const PORT = process.env.PORT || 5000

const start = async () => {
    const envIssues = validateEnv()
    if (envIssues.length > 0) {
        console.error("\n[config] Fix your .env before continuing:\n");
        envIssues.forEach((msg) => console.error(`  - ${msg}`));
        console.error("\nRestart the server after updating .env\n");
        process.exit(1);
    }

    await connectDB()
    await ensureDemoClient()

    const emailMode = getEmailTransportMode()
    console.log(`Email transport: ${emailMode}`)

    app.listen(PORT, () => {
        console.log(`Server is running at ${PORT} in ${process.env.NODE_ENV} mode`)
    })
}

start().catch( (err) => {
    console.error("Failed to start the server:", err.message)
    process.exit(1)
})

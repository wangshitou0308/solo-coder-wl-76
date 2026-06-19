/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { seedDatabase } from './src/db/seed.js'

import modelRoutes from './src/routes/modelRoutes.js'
import stepRoutes from './src/routes/stepRoutes.js'
import foldRoutes from './src/routes/foldRoutes.js'
import paperRoutes from './src/routes/paperRoutes.js'
import statisticsRoutes from './src/routes/statisticsRoutes.js'
import uploadRoutes from './src/routes/uploadRoutes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

seedDatabase()

app.use('/api/models', modelRoutes)
app.use('/api/models/:modelId/steps', stepRoutes)
app.use('/api/folds', foldRoutes)
app.use('/api/paper', paperRoutes)
app.use('/api/statistics', statisticsRoutes)
app.use('/api/upload', uploadRoutes)

app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(error)
  res.status(500).json({
    success: false,
    error: error.message || 'Server internal error',
  })
})

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app

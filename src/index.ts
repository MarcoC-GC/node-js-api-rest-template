/**
 * Application Entry Point
 *
 * Bootstrap sequence:
 * 1. Load and validate configuration
 * 2. Setup dependency injection container
 * 3. Create and start application
 * 4. Setup graceful shutdown handlers
 */

import { Config } from '@/config'
import { Container } from '@/config/container'
import { App } from './app'

/**
 * Bootstrap the application
 */
async function bootstrap(): Promise<void> {
  try {
    // 1. Load configuration
    const config = Config.load()

    // 2. Setup dependency injection
    Container.setup(config)

    // 3. Create application
    const app = new App()

    // 4. Setup graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down...')
      await app.shutdown()
      process.exit(0)
    })

    process.on('SIGINT', async () => {
      console.log('SIGINT received, shutting down...')
      await app.shutdown()
      process.exit(0)
    })

    // 5. Start application
    await app.start()
  } catch (error) {
    console.error('Failed to start application:', error)
    process.exit(1)
  }
}

// Start the application
bootstrap()

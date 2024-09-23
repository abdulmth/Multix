import 'dotenv/config'

interface EnvValues {
  blockstart: string
  prefix: number
  rpcWs: string
  archiveName?: string
  chainId: string
  isEthereum?: boolean
}

export class Env {
  env: EnvValues

  constructor() {
    this.env = {
      blockstart: "22657963",
      prefix: 0,
      rpcWs: 'ws://localhost:8000',
      archiveName: 'polkadot',
      chainId:'polkadot',
      isEthereum:false
    }

    this.checkForUndefined()
  }

  checkForUndefined = () => {
    Object.entries(this.env).forEach(([key, value]) => {
      // a prefix can be 0 and it is a valid value
      if (!value && value !== 0 && value !== false) {
        console.warn(`ℹ️ No env variable set for ${key} - (may be optional)`)
      }
    })
  }

  getEnv = () => {
    return this.env
  }
}

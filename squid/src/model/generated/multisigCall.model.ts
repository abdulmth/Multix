import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import {Multisig} from "./multisig.model"

@Entity_()
export class MultisigCall {
  constructor(props?: Partial<MultisigCall>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Column_("text", {nullable: false})
  blockHash!: string

  @Column_("timestamp with time zone", {nullable: false})
  timestamp!: Date

  @Index_()
  @ManyToOne_(() => Multisig, {nullable: true})
  multisig!: Multisig | undefined | null

  @Column_("int4", {nullable: false})
  callIndex!: number
}

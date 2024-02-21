import { BigNumberRawValue, DAL } from "@medusajs/types"
import {
  BigNumber,
  BigNumberField,
  createPsqlIndexStatementHelper,
  generateEntityId,
} from "@medusajs/utils"
import {
  BeforeCreate,
  Cascade,
  Collection,
  Entity,
  ManyToOne,
  OnInit,
  OneToMany,
  OptionalProps,
  PrimaryKey,
  Property,
} from "@mikro-orm/core"
import LineItemAdjustment from "./line-item-adjustment"
import LineItemTaxLine from "./line-item-tax-line"
import OrderDetail from "./order-detail"

type OptionalLineItemProps =
  | "is_discoutable"
  | "is_tax_inclusive"
  | "compare_at_unit_price"
  | "requires_shipping"
  | DAL.EntityDateColumns

const ProductIdIndex = createPsqlIndexStatementHelper({
  tableName: "order_line_item",
  columns: "product_id",
})

const VariantIdIndex = createPsqlIndexStatementHelper({
  tableName: "order_line_item",
  columns: "variant_id",
})

@Entity({ tableName: "order_line_item" })
export default class LineItem {
  [OptionalProps]?: OptionalLineItemProps

  @PrimaryKey({ columnType: "text" })
  id: string

  @ManyToOne({
    entity: () => OrderDetail,
    onDelete: "cascade",
    cascade: [Cascade.REMOVE, Cascade.PERSIST],
  })
  totals: OrderDetail

  @Property({ columnType: "text" })
  title: string

  @Property({ columnType: "text", nullable: true })
  subtitle: string | null = null

  @Property({ columnType: "text", nullable: true })
  thumbnail: string | null = null

  @Property({
    columnType: "text",
    nullable: true,
  })
  @VariantIdIndex.MikroORMIndex()
  variant_id: string | null = null

  @Property({
    columnType: "text",
    nullable: true,
  })
  @ProductIdIndex.MikroORMIndex()
  product_id: string | null = null

  @Property({ columnType: "text", nullable: true })
  product_title: string | null = null

  @Property({ columnType: "text", nullable: true })
  product_description: string | null = null

  @Property({ columnType: "text", nullable: true })
  product_subtitle: string | null = null

  @Property({ columnType: "text", nullable: true })
  product_type: string | null = null

  @Property({ columnType: "text", nullable: true })
  product_collection: string | null = null

  @Property({ columnType: "text", nullable: true })
  product_handle: string | null = null

  @Property({ columnType: "text", nullable: true })
  variant_sku: string | null = null

  @Property({ columnType: "text", nullable: true })
  variant_barcode: string | null = null

  @Property({ columnType: "text", nullable: true })
  variant_title: string | null = null

  @Property({ columnType: "jsonb", nullable: true })
  variant_option_values: Record<string, unknown> | null = null

  @Property({ columnType: "boolean" })
  requires_shipping = true

  @Property({ columnType: "boolean" })
  is_discountable = true

  @Property({ columnType: "boolean" })
  is_tax_inclusive = false

  @Property({ columnType: "numeric", nullable: true })
  @BigNumberField({ nullable: true })
  compare_at_unit_price?: BigNumber | number | null = null

  @Property({ columnType: "jsonb", nullable: true })
  raw_compare_at_unit_price: BigNumberRawValue | null = null

  @Property({ columnType: "numeric" })
  @BigNumberField()
  unit_price: BigNumber | number

  @Property({ columnType: "jsonb" })
  raw_unit_price: BigNumberRawValue

  @OneToMany(() => LineItemTaxLine, (taxLine) => taxLine.item, {
    cascade: [Cascade.REMOVE],
  })
  tax_lines = new Collection<LineItemTaxLine>(this)

  @OneToMany(() => LineItemAdjustment, (adjustment) => adjustment.item, {
    cascade: [Cascade.REMOVE],
  })
  adjustments = new Collection<LineItemAdjustment>(this)

  @Property({
    onCreate: () => new Date(),
    columnType: "timestamptz",
    defaultRaw: "now()",
  })
  created_at: Date

  @Property({
    onCreate: () => new Date(),
    onUpdate: () => new Date(),
    columnType: "timestamptz",
    defaultRaw: "now()",
  })
  updated_at: Date

  @BeforeCreate()
  onCreate() {
    this.id = generateEntityId(this.id, "ordli")
  }

  @OnInit()
  onInit() {
    this.id = generateEntityId(this.id, "ordli")
  }
}
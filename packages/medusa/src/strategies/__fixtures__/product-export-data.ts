import { IdMap } from "medusa-test-utils";

const productIds = ["product-export-strategy-product-1", "product-export-strategy-product-2"];
const variantIds = ["product-export-strategy-variant-1", "product-export-strategy-variant-2", "product-export-strategy-variant-3"];
export const productsToExport = [
    {
        sales_channels: [{ id: IdMap.getId("sc_1"), name: "SC 1", description: "SC 1" }],
        collection: {
            created_at: "randomString",
            deleted_at: null,
            handle: "test-collection1",
            id: IdMap.getId("product-export-collection_1"),
            metadata: null,
            title: "Test collection 1",
            updated_at: "randomString"
        },
        collection_id: IdMap.getId("product-export-collection_1"),
        created_at: "randomString",
        deleted_at: null,
        description: "test-product-description-1",
        discountable: true,
        external_id: null,
        handle: "test-product-product-1",
        height: null,
        hs_code: null,
        id: productIds[0],
        images: [
            {
                created_at: "randomString",
                deleted_at: null,
                id: IdMap.getId("product-export-image_1"),
                metadata: null,
                updated_at: "randomString",
                url: "test-image.png"
            }
        ],
        is_giftcard: false,
        length: null,
        material: null,
        metadata: null,
        mid_code: null,
        options: [
            {
                created_at: "randomString",
                deleted_at: null,
                id: IdMap.getId("product-export-option_1"),
                metadata: null,
                product_id: productIds[0],
                title: "test-option-1",
                updated_at: "randomString"
            },
            {
                created_at: "randomString2",
                deleted_at: null,
                id: IdMap.getId("product-export-option_2"),
                metadata: null,
                product_id: productIds[0],
                title: "test-option-2",
                updated_at: "randomString2"
            }
        ],
        origin_country: null,
        profile_id: IdMap.getId("product-export-profile_1"),
        profile: {
            id: IdMap.getId("product-export-profile_1"),
            name: "profile_1",
            type: "profile_type_1"
        },
        status: "draft",
        subtitle: null,
        tags: [
            {
                created_at: "randomString",
                deleted_at: null,
                id: IdMap.getId("product-export-tag_1"),
                metadata: null,
                updated_at: "randomString",
                value: "123_1"
            }
        ],
        thumbnail: null,
        title: "Test product",
        type: {
            created_at: "randomString",
            deleted_at: null,
            id: IdMap.getId("product-export-type_1"),
            metadata: null,
            updated_at: "randomString",
            value: "test-type-1"
        },
        type_id: IdMap.getId("product-export-type_1"),
        updated_at: "randomString",
        variants: [
            {
                allow_backorder: false,
                barcode: "test-barcode",
                calculated_price: null,
                created_at: "randomString",
                deleted_at: null,
                ean: "test-ean",
                height: null,
                hs_code: null,
                id: variantIds[0],
                inventory_quantity: 10,
                length: null,
                manage_inventory: true,
                material: null,
                metadata: null,
                mid_code: null,
                options: [
                    {
                        created_at: "randomString",
                        deleted_at: null,
                        id: IdMap.getId("product-export-variant_option_1"),
                        metadata: null,
                        option_id: IdMap.getId("product-export-option_1"),
                        updated_at: "randomString",
                        value: "option 1 value 1",
                        variant_id: variantIds[0]
                    },
                    {
                        created_at: "randomString",
                        deleted_at: null,
                        id: IdMap.getId("product-export-variant_option_2"),
                        metadata: null,
                        option_id: IdMap.getId("product-export-option_2"),
                        updated_at: "randomString",
                        value: "option 2 value 1",
                        variant_id: variantIds[0]
                    }
                ],
                origin_country: null,
                original_price: null,
                prices: [
                    {
                        amount: 100,
                        created_at: "randomString",
                        deleted_at: null,
                        id: IdMap.getId("product-export-price_1"),
                        region_id: IdMap.getId("product-export-region_1"),
                        max_quantity: null,
                        min_quantity: null,
                        price_list: null,
                        price_list_id: null,
                        region: {
                            id: IdMap.getId("product-export-region_1"),
                            currency_code: "usd",
                            name: "france"
                        },
                        updated_at: "randomString",
                        variant_id: variantIds[0]
                    },
                    {
                        amount: 110,
                        created_at: "randomString",
                        currency_code: "usd",
                        deleted_at: null,
                        id: IdMap.getId("product-export-price_1"),
                        region_id: null,
                        max_quantity: null,
                        min_quantity: null,
                        price_list: null,
                        price_list_id: null,
                        updated_at: "randomString",
                        variant_id: variantIds[0]
                    },
                    {
                        amount: 130,
                        created_at: "randomString",
                        deleted_at: null,
                        id: IdMap.getId("product-export-price_1"),
                        region_id: IdMap.getId("product-export-region_1"),
                        max_quantity: null,
                        min_quantity: null,
                        price_list: null,
                        price_list_id: null,
                        region: {
                            id: IdMap.getId("product-export-region_3"),
                            name: "denmark",
                            currency_code: "dkk"
                        },
                        updated_at: "randomString",
                        variant_id: variantIds[0]
                    }
                ],
                product_id: IdMap.getId("product-export-product_1"),
                sku: "test-sku",
                title: "Test variant",
                upc: "test-upc",
                updated_at: "randomString",
                weight: null,
                width: null
            }
        ],
        weight: null,
        width: null
    },
    {
        sales_channels: [
            { id: IdMap.getId("sc_1"), name: "SC 1", description: "SC 1" },
            { id: IdMap.getId("sc_2"), name: "SC 2", description: "SC 2" }
        ],
        collection: {
            created_at: "randomString",
            deleted_at: null,
            handle: "test-collection2",
            id: IdMap.getId("product-export-collection_2"),
            metadata: null,
            title: "Test collection",
            updated_at: "randomString"
        },
        collection_id: "test-collection",
        created_at: "randomString",
        deleted_at: null,
        description: "test-product-description",
        discountable: true,
        external_id: null,
        handle: "test-product-product-2",
        height: null,
        hs_code: null,
        id: productIds[1],
        images: [
            {
                created_at: "randomString",
                deleted_at: null,
                id: IdMap.getId("product-export-image_2"),
                metadata: null,
                updated_at: "randomString",
                url: "test-image.png"
            }
        ],
        is_giftcard: false,
        length: null,
        material: null,
        metadata: null,
        mid_code: null,
        options: [
            {
                created_at: "randomString",
                deleted_at: null,
                id: IdMap.getId("product-export-option_2"),
                metadata: null,
                product_id: productIds[1],
                title: "test-option",
                updated_at: "randomString"
            }
        ],
        origin_country: null,
        profile_id: IdMap.getId("product-export-profile_2"),
        profile: {
            id: IdMap.getId("product-export-profile_2"),
            name: "profile_2",
            type: "profile_type_2"
        },
        status: "draft",
        subtitle: null,
        tags: [
            {
                created_at: "randomString",
                deleted_at: null,
                id: IdMap.getId("product-export-tag_2"),
                metadata: null,
                updated_at: "randomString",
                value: "123"
            }
        ],
        thumbnail: null,
        title: "Test product",
        type: {
            created_at: "randomString",
            deleted_at: null,
            id: IdMap.getId("product-export-type_2"),
            metadata: null,
            updated_at: "randomString",
            value: "test-type"
        },
        type_id: "test-type",
        updated_at: "randomString",
        variants: [
            {
                allow_backorder: false,
                barcode: "test-barcode",
                calculated_price: null,
                created_at: "randomString",
                deleted_at: null,
                ean: "test-ean",
                height: null,
                hs_code: null,
                id: variantIds[1],
                inventory_quantity: 10,
                length: null,
                manage_inventory: true,
                material: null,
                metadata: null,
                mid_code: null,
                options: [
                    {
                        created_at: "randomString",
                        deleted_at: null,
                        id: IdMap.getId("product-export-variant_option_2"),
                        metadata: null,
                        option_id: IdMap.getId("product-export-option_2"),
                        updated_at: "randomString",
                        value: "Option 1 value 1",
                        variant_id: variantIds[1]
                    }
                ],
                origin_country: null,
                original_price: null,
                prices: [
                    {
                        amount: 110,
                        created_at: "randomString",
                        deleted_at: null,
                        id: IdMap.getId("product-export-price_2"),
                        max_quantity: null,
                        min_quantity: null,
                        price_list: null,
                        price_list_id: null,
                        region_id: IdMap.getId("product-export-region_2"),
                        region: {
                            id: IdMap.getId("product-export-region_2"),
                            name: "Denmark",
                            currency_code: "dkk"
                        },
                        updated_at: "randomString",
                        variant_id: variantIds[1]
                    }
                ],
                product_id: IdMap.getId("product-export-product_2"),
                sku: "test-sku",
                title: "Test variant",
                upc: "test-upc",
                updated_at: "randomString",
                weight: null,
                width: null
            },
            {
                allow_backorder: false,
                barcode: "test-barcode",
                calculated_price: null,
                created_at: "randomString",
                deleted_at: null,
                ean: "test-ean",
                height: null,
                hs_code: null,
                id: variantIds[2],
                inventory_quantity: 10,
                length: null,
                manage_inventory: true,
                material: null,
                metadata: null,
                mid_code: null,
                options: [
                    {
                        created_at: "randomString",
                        deleted_at: null,
                        id: IdMap.getId("product-export-variant_option_2"),
                        metadata: null,
                        option_id: IdMap.getId("product-export-option_2"),
                        updated_at: "randomString",
                        value: "Option 1 Value 1",
                        variant_id: variantIds[2]
                    }
                ],
                origin_country: null,
                original_price: null,
                prices: [
                    {
                        amount: 120,
                        created_at: "randomString",
                        currency_code: "usd",
                        deleted_at: null,
                        id: IdMap.getId("product-export-price_2"),
                        max_quantity: null,
                        min_quantity: null,
                        price_list: null,
                        price_list_id: null,
                        region_id: IdMap.getId("product-export-region_1"),
                        updated_at: "randomString",
                        variant_id: variantIds[2]
                    }
                ],
                product_id: productIds[1],
                sku: "test-sku",
                title: "Test variant",
                upc: "test-upc",
                updated_at: "randomString",
                weight: null,
                width: null
            }
        ],
        weight: null,
        width: null
    }
];

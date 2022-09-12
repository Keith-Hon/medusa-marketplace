import { MedusaError } from "medusa-core-utils"

export enum PostgresError {
  DUPLICATE_ERROR = "23505",
  FOREIGN_KEY_ERROR = "23503",
}
export const formatException = (err): Error => {
  switch (err.code) {
    case PostgresError.DUPLICATE_ERROR:
      return new MedusaError(
        MedusaError.Types.DUPLICATE_ERROR,
        `${err.table.charAt(0).toUpperCase()}${err.table.slice(
          1
        )} with ${err.detail
          .slice(4)
          .replace(/[()=]/g, (s) => (s === "=" ? " " : ""))}`
      )
    case PostgresError.FOREIGN_KEY_ERROR: {
      const matches =
        /Key \(([\w-\d]+)\)=\(([\w-\d]+)\) is not present in table "(\w+)"/g.exec(
          err.detail
        )

      if (matches?.length !== 4) {
        return new MedusaError(
          MedusaError.Types.NOT_FOUND,
          JSON.stringify(matches)
        )
      }

      return new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `${matches[3]?.charAt(0).toUpperCase()}${matches[3]?.slice(1)} with ${
          matches[1]
        } ${matches[2]} does not exist.`
      )
    }
    default:
      return err
  }
}

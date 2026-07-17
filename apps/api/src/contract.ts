import type { componentSchemas } from "@honeymoon-period/generated";
import { contractValidators } from "@honeymoon-period/generated/validators";
import type { ErrorObject } from "ajv";

type StaticValidator = ((value: unknown) => boolean) & { errors?: ErrorObject[] | null };

export class ContractError extends Error {
  constructor(public readonly fields: Record<string, string>) {
    super("payload does not match the API contract");
  }
}

export function assertContract(schemaName: keyof typeof componentSchemas, value: unknown): void {
  const validate = contractValidators[schemaName] as StaticValidator;
  if (!validate(value)) {
    throw new ContractError(Object.fromEntries((validate.errors as ErrorObject[]).map(errorField)));
  }
}

function errorField(error: ErrorObject): [string, string] {
  return [
    error.instancePath ||
      error.params.missingProperty?.toString() ||
      error.params.additionalProperty?.toString() ||
      "body",
    String(error.message),
  ];
}

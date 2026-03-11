export function validateIntakeForm(fields) {
  const errors = {};
  if (!fields.productName?.trim()) errors.productName = "Product name is required";
  if (!fields.description?.trim()) errors.description = "Product description is required";
  if (!fields.targetUsers?.trim()) errors.targetUsers = "Target users is required";
  if (!fields.coreFeatures?.trim()) errors.coreFeatures = "Core features is required";
  return { isValid: Object.keys(errors).length === 0, errors };
}

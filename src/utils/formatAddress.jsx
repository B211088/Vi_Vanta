// Helper function to format address
export const formatAddress = (address) => {
  console.log({ address });
  if (!address) return "";
  return `${address.wardId.name} - ${address.districtId.name} - ${address.provinceId.name} - ${address.specificAddress}`;
};

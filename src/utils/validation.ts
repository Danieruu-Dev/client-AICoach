export function isValidEmailAddress(value: string) {
  const email = value.trim();

  if (!email || email.length > 254) return false;
  if ([...email].some((char) => char.trim() === "")) return false;

  const atIndex = email.indexOf("@");
  if (atIndex <= 0 || atIndex !== email.lastIndexOf("@")) return false;

  const localPart = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);
  const dotIndex = domain.lastIndexOf(".");

  return (
    localPart.length <= 64 &&
    domain.length > 0 &&
    domain.length <= 253 &&
    dotIndex > 0 &&
    dotIndex < domain.length - 1
  );
}

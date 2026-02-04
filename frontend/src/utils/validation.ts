export const luhnCheck = (val: string) => {
  let checksum = 0;
  let j = 1;
  for (let i = val.length - 1; i >= 0; i--) {
    let calc = 0;
    calc = Number(val.charAt(i)) * j;
    if (calc > 9) {
      checksum = checksum + 1;
      calc = calc - 10;
    }
    checksum = checksum + calc;
    if (j == 1) {
      j = 2;
    } else {
      j = 1;
    }
  }
  return (checksum % 10) == 0;
};

export const getCardType = (number: string): 'VISA' | 'MASTERCARD' | 'UNKNOWN' => {
  const visaRegEx = /^4[0-9]{12}(?:[0-9]{3})?$/;
  const mastercardRegEx = /^5[1-5][0-9]{14}$/; // Simple regex, real ones are more complex

  if (visaRegEx.test(number)) {
    return 'VISA';
  }
  if (mastercardRegEx.test(number)) {
    return 'MASTERCARD';
  }
  return 'UNKNOWN';
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

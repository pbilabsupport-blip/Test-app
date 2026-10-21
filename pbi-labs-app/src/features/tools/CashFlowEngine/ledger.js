export function recordYield(incomes, asset) {
  const amount = Number(asset.yieldAmount) || 0;
  const linkedIndex = incomes.findIndex((item) => item.linkedAssetId === asset.id);
  if (linkedIndex >= 0) {
    return incomes.map((item, index) => (
      index === linkedIndex
        ? { ...item, amount, isPassive: true, category: 'Passive' }
        : item
    ));
  }

  const looseIndex = incomes.findIndex((item) => (
    !item.linkedAssetId
    && (item.isPassive || item.category === 'Passive')
    && Number(item.amount) === amount
  ));
  if (looseIndex >= 0) {
    return incomes.map((item, index) => (
      index === looseIndex
        ? { ...item, linkedAssetId: asset.id, amount, isPassive: true, category: 'Passive' }
        : item
    ));
  }

  return [
    ...incomes,
    {
      id: `yield-${asset.id}`,
      name: `${asset.name} (Yield)`,
      amount,
      category: 'Passive',
      isPassive: true,
      linkedAssetId: asset.id
    }
  ];
}

export function recordPayment(expenses, liability, paymentAmount) {
  const amount = Number(paymentAmount) || 0;
  const linkedIndex = expenses.findIndex((item) => item.linkedLiabilityId === liability.id);
  if (linkedIndex >= 0) {
    return expenses.map((item, index) => (
      index === linkedIndex
        ? { ...item, amount, category: item.category || 'Debt' }
        : item
    ));
  }

  return [
    ...expenses,
    {
      id: `pay-${liability.id}`,
      name: `${liability.name} (Payment)`,
      amount,
      category: 'Debt',
      linkedLiabilityId: liability.id
    }
  ];
}

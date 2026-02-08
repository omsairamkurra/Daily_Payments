// SIP Maturity: FV = P * [(1+r)^n - 1] / r * (1+r)
export function calculateSIPMaturity(
  monthlyAmount: number,
  years: number,
  annualReturnPercent: number
): number {
  const monthlyRate = annualReturnPercent / 100 / 12
  const months = years * 12
  if (monthlyRate === 0) return monthlyAmount * months
  return monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate)
}

// Lump Sum: FV = PV * (1+r)^n
export function calculateLumpSum(
  principal: number,
  years: number,
  annualReturnPercent: number
): number {
  const rate = annualReturnPercent / 100
  return principal * Math.pow(1 + rate, years)
}

// CAGR: (FV/PV)^(1/n) - 1
export function calculateCAGR(
  initialValue: number,
  finalValue: number,
  years: number
): number {
  if (initialValue <= 0 || years <= 0) return 0
  return (Math.pow(finalValue / initialValue, 1 / years) - 1) * 100
}

// EMI: P * r * (1+r)^n / [(1+r)^n - 1]
export function calculateEMI(
  principal: number,
  annualRate: number,
  tenureMonths: number
): number {
  const monthlyRate = annualRate / 100 / 12
  if (monthlyRate === 0) return principal / tenureMonths
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1)
}

// Total interest paid over loan tenure
export function calculateTotalInterest(
  principal: number,
  annualRate: number,
  tenureMonths: number
): number {
  const emi = calculateEMI(principal, annualRate, tenureMonths)
  return emi * tenureMonths - principal
}

// Avalanche strategy: pay minimums on all, extra on highest rate
export function calculateAvalanchePayoff(
  loans: Array<{ id: string; remainingAmount: number; interestRate: number; emiAmount: number }>,
  extraMonthly: number
): { totalInterest: number; months: number; schedule: Array<{ month: number; balances: Record<string, number> }> } {
  const balances: Record<string, number> = {}
  const rates: Record<string, number> = {}
  const minimums: Record<string, number> = {}

  loans.forEach(l => {
    balances[l.id] = l.remainingAmount
    rates[l.id] = l.interestRate / 100 / 12
    minimums[l.id] = l.emiAmount
  })

  let totalInterest = 0
  let month = 0
  const schedule: Array<{ month: number; balances: Record<string, number> }> = []

  while (Object.values(balances).some(b => b > 0) && month < 600) {
    month++
    let extra = extraMonthly

    // Add interest
    for (const id of Object.keys(balances)) {
      if (balances[id] > 0) {
        const interest = balances[id] * rates[id]
        totalInterest += interest
        balances[id] += interest
      }
    }

    // Pay minimums
    for (const id of Object.keys(balances)) {
      if (balances[id] > 0) {
        const payment = Math.min(minimums[id], balances[id])
        balances[id] -= payment
      }
    }

    // Pay extra on highest rate
    const sorted = Object.keys(balances)
      .filter(id => balances[id] > 0)
      .sort((a, b) => rates[b] - rates[a])

    for (const id of sorted) {
      if (extra <= 0) break
      const payment = Math.min(extra, balances[id])
      balances[id] -= payment
      extra -= payment
    }

    if (month % 3 === 0 || Object.values(balances).every(b => b <= 0)) {
      schedule.push({ month, balances: { ...balances } })
    }
  }

  return { totalInterest, months: month, schedule }
}

// Snowball strategy: pay minimums on all, extra on smallest balance
export function calculateSnowballPayoff(
  loans: Array<{ id: string; remainingAmount: number; interestRate: number; emiAmount: number }>,
  extraMonthly: number
): { totalInterest: number; months: number; schedule: Array<{ month: number; balances: Record<string, number> }> } {
  const balances: Record<string, number> = {}
  const rates: Record<string, number> = {}
  const minimums: Record<string, number> = {}

  loans.forEach(l => {
    balances[l.id] = l.remainingAmount
    rates[l.id] = l.interestRate / 100 / 12
    minimums[l.id] = l.emiAmount
  })

  let totalInterest = 0
  let month = 0
  const schedule: Array<{ month: number; balances: Record<string, number> }> = []

  while (Object.values(balances).some(b => b > 0) && month < 600) {
    month++
    let extra = extraMonthly

    for (const id of Object.keys(balances)) {
      if (balances[id] > 0) {
        const interest = balances[id] * rates[id]
        totalInterest += interest
        balances[id] += interest
      }
    }

    for (const id of Object.keys(balances)) {
      if (balances[id] > 0) {
        const payment = Math.min(minimums[id], balances[id])
        balances[id] -= payment
      }
    }

    // Pay extra on smallest balance
    const sorted = Object.keys(balances)
      .filter(id => balances[id] > 0)
      .sort((a, b) => balances[a] - balances[b])

    for (const id of sorted) {
      if (extra <= 0) break
      const payment = Math.min(extra, balances[id])
      balances[id] -= payment
      extra -= payment
    }

    if (month % 3 === 0 || Object.values(balances).every(b => b <= 0)) {
      schedule.push({ month, balances: { ...balances } })
    }
  }

  return { totalInterest, months: month, schedule }
}

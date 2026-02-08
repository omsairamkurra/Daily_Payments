import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    // Helper: get start/end of a month
    const monthRange = (year: number, month: number) => {
      const start = `${year}-${month.toString().padStart(2, '0')}-01`
      const end = new Date(year, month, 0).toISOString().split('T')[0]
      return { start, end }
    }

    const { start: curStart, end: curEnd } = monthRange(currentYear, currentMonth)

    // =============================================
    // 1. SAVINGS RATE (25 pts)
    // =============================================
    // Fetch this month's income
    const { data: incomeEntries } = await supabase
      .from('income_entries')
      .select('amount')
      .eq('user_id', user.id)
      .gte('date', curStart)
      .lte('date', curEnd)

    const monthlyIncome = (incomeEntries || []).reduce(
      (sum, e) => sum + Number(e.amount),
      0
    )

    // Fetch this month's expenses
    const { data: expenses } = await supabase
      .from('payments')
      .select('amount')
      .eq('user_id', user.id)
      .gte('date', curStart)
      .lte('date', curEnd)

    const monthlyExpenses = (expenses || []).reduce(
      (sum, p) => sum + Number(p.amount),
      0
    )

    let savingsRateScore = 0
    let savingsRateDetails = ''

    if (monthlyIncome > 0) {
      const savingsRate = (monthlyIncome - monthlyExpenses) / monthlyIncome
      savingsRateScore = Math.max(0, Math.min(25, Math.round(savingsRate * 25)))
      savingsRateDetails = `Savings rate: ${(savingsRate * 100).toFixed(1)}% (Income: ${formatCurrency(monthlyIncome)}, Expenses: ${formatCurrency(monthlyExpenses)})`
    } else {
      savingsRateDetails = 'No income recorded this month'
    }

    // =============================================
    // 2. DEBT-TO-INCOME (25 pts)
    // =============================================
    const { data: loans } = await supabase
      .from('loans')
      .select('emi_amount')
      .eq('user_id', user.id)

    const totalMonthlyEmi = (loans || []).reduce(
      (sum, l) => sum + Number(l.emi_amount),
      0
    )

    let debtToIncomeScore = 0
    let debtToIncomeDetails = ''

    if (monthlyIncome > 0) {
      const dtiRatio = totalMonthlyEmi / monthlyIncome
      if (dtiRatio < 0.3) {
        debtToIncomeScore = 25
      } else if (dtiRatio <= 0.5) {
        debtToIncomeScore = 15
      } else {
        debtToIncomeScore = 5
      }
      debtToIncomeDetails = `DTI ratio: ${(dtiRatio * 100).toFixed(1)}% (Total EMI: ${formatCurrency(totalMonthlyEmi)})`
    } else if (totalMonthlyEmi === 0) {
      debtToIncomeScore = 25
      debtToIncomeDetails = 'No active loans'
    } else {
      debtToIncomeScore = 5
      debtToIncomeDetails = 'No income recorded to calculate DTI ratio'
    }

    // =============================================
    // 3. EMERGENCY FUND (20 pts)
    // =============================================
    const { data: emergencyGoals } = await supabase
      .from('savings_goals')
      .select('saved_amount')
      .eq('user_id', user.id)
      .ilike('name', '%emergency%')

    const emergencySaved = (emergencyGoals || []).reduce(
      (sum, g) => sum + Number(g.saved_amount),
      0
    )

    let emergencyFundScore = 0
    let emergencyFundDetails = ''

    if (monthlyExpenses > 0) {
      const sixMonthExpenses = 6 * monthlyExpenses
      const emergencyRatio = Math.min(1, emergencySaved / sixMonthExpenses)
      emergencyFundScore = Math.round(emergencyRatio * 20)
      emergencyFundDetails = `Emergency fund: ${formatCurrency(emergencySaved)} / ${formatCurrency(sixMonthExpenses)} (${(emergencyRatio * 100).toFixed(0)}% of 6-month expenses)`
    } else if (emergencySaved > 0) {
      emergencyFundScore = 20
      emergencyFundDetails = `Emergency fund: ${formatCurrency(emergencySaved)} (no expenses this month to compare)`
    } else {
      emergencyFundDetails = 'No emergency fund goals found (create a goal with "emergency" in the name)'
    }

    // =============================================
    // 4. BUDGET ADHERENCE (15 pts)
    // =============================================
    let budgetAdherenceScore = 0
    let budgetAdherenceDetails = ''
    let adherentMonths = 0
    let totalBudgetMonths = 0

    // Check last 6 months
    for (let i = 0; i < 6; i++) {
      const checkDate = new Date(currentYear, currentMonth - 1 - i, 1)
      const checkMonth = checkDate.getMonth() + 1
      const checkYear = checkDate.getFullYear()

      const { data: budget } = await supabase
        .from('monthly_budgets')
        .select('salary')
        .eq('user_id', user.id)
        .eq('month', checkMonth)
        .eq('year', checkYear)
        .single()

      if (budget) {
        totalBudgetMonths++
        const { start, end } = monthRange(checkYear, checkMonth)

        const { data: monthPayments } = await supabase
          .from('payments')
          .select('amount')
          .eq('user_id', user.id)
          .gte('date', start)
          .lte('date', end)

        const monthSpent = (monthPayments || []).reduce(
          (sum, p) => sum + Number(p.amount),
          0
        )

        if (monthSpent <= Number(budget.salary)) {
          adherentMonths++
        }
      }
    }

    if (totalBudgetMonths > 0) {
      budgetAdherenceScore = Math.round((adherentMonths / 6) * 15)
      budgetAdherenceDetails = `${adherentMonths} of ${totalBudgetMonths} budgeted month${totalBudgetMonths !== 1 ? 's' : ''} within budget (last 6 months)`
    } else {
      budgetAdherenceDetails = 'No budgets set in the last 6 months'
    }

    // =============================================
    // 5. INVESTMENT DIVERSITY (15 pts)
    // =============================================
    const { data: investments } = await supabase
      .from('investments')
      .select('type')
      .eq('user_id', user.id)

    const distinctTypes = new Set(
      (investments || []).map((inv) => inv.type).filter(Boolean)
    )
    const typeCount = distinctTypes.size

    let investmentDiversityScore = 0
    if (typeCount >= 5) {
      investmentDiversityScore = 15
    } else if (typeCount === 4) {
      investmentDiversityScore = 12
    } else if (typeCount === 3) {
      investmentDiversityScore = 9
    } else if (typeCount === 2) {
      investmentDiversityScore = 6
    } else if (typeCount === 1) {
      investmentDiversityScore = 3
    }

    const investmentDiversityDetails = typeCount > 0
      ? `${typeCount} investment type${typeCount !== 1 ? 's' : ''}: ${Array.from(distinctTypes).join(', ')}`
      : 'No investments recorded'

    // =============================================
    // TOTAL SCORE & RECOMMENDATIONS
    // =============================================
    const totalScore =
      savingsRateScore +
      debtToIncomeScore +
      emergencyFundScore +
      budgetAdherenceScore +
      investmentDiversityScore

    const recommendations: string[] = []

    if (savingsRateScore < 15) {
      recommendations.push(
        'Try to save at least 20% of your monthly income to build a strong financial foundation.'
      )
    }
    if (debtToIncomeScore < 20) {
      recommendations.push(
        'Your debt-to-income ratio is high. Consider paying off high-interest debts first.'
      )
    }
    if (emergencyFundScore < 15) {
      recommendations.push(
        'Build an emergency fund covering at least 6 months of expenses. Create a savings goal with "emergency" in its name.'
      )
    }
    if (budgetAdherenceScore < 10) {
      recommendations.push(
        'Set monthly budgets and track your spending to stay within limits.'
      )
    }
    if (investmentDiversityScore < 9) {
      recommendations.push(
        'Diversify your investments across different asset types (stocks, mutual funds, FDs, gold, etc.).'
      )
    }
    if (totalScore >= 75 && recommendations.length === 0) {
      recommendations.push(
        'Great financial health! Keep maintaining your savings and investment habits.'
      )
    }

    return NextResponse.json({
      totalScore,
      breakdown: {
        savingsRate: {
          score: savingsRateScore,
          max: 25,
          details: savingsRateDetails,
        },
        debtToIncome: {
          score: debtToIncomeScore,
          max: 25,
          details: debtToIncomeDetails,
        },
        emergencyFund: {
          score: emergencyFundScore,
          max: 20,
          details: emergencyFundDetails,
        },
        budgetAdherence: {
          score: budgetAdherenceScore,
          max: 15,
          details: budgetAdherenceDetails,
        },
        investmentDiversity: {
          score: investmentDiversityScore,
          max: 15,
          details: investmentDiversityDetails,
        },
      },
      recommendations,
    })
  } catch (error) {
    console.error('Error computing health score:', error)
    return NextResponse.json(
      { error: 'Failed to compute financial health score' },
      { status: 500 }
    )
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

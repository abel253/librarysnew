// server/api/settings/index.get.ts
export default defineEventHandler(async () => {
  try {
    const [configs, dueConfigs, fineConfigs] = await Promise.all([
      prisma.systemConfig.findMany(),
      prisma.dueDateConfig.findMany(),
      prisma.fineConfig.findMany()
    ])

    return {
      success: true,
      data: {
        libraryName: 'Mekdela Amba University Library',
        libraryCode: 'MAU-LCS',
        academicYear: '2026/2027',
        shortLoanDays: 3,
        longLoanDays: 14,
        shortLoanFineRate: 2.0,
        longLoanFineRate: 1.0,
        maxFineCap: 50.0,
        enableEmailNotifications: true,
        enableAutoOverdueAudit: true,
        allowOnlineRenewal: true,
        maxRenewalsPerBook: 2,
        openingHours: 'Mon - Fri: 8:00 AM - 10:00 PM | Sat - Sun: 9:00 AM - 6:00 PM',
        configs,
        dueConfigs,
        fineConfigs
      }
    }
  } catch (err: any) {
    console.error('Fetch settings error:', err)
    return {
      success: true,
      data: {
        libraryName: 'Mekdela Amba University Library',
        libraryCode: 'MAU-LCS',
        academicYear: '2026/2027',
        shortLoanDays: 3,
        longLoanDays: 14,
        shortLoanFineRate: 2.0,
        longLoanFineRate: 1.0,
        maxFineCap: 50.0,
        enableEmailNotifications: true,
        enableAutoOverdueAudit: true,
        allowOnlineRenewal: true,
        maxRenewalsPerBook: 2,
        openingHours: 'Mon - Fri: 8:00 AM - 10:00 PM | Sat - Sun: 9:00 AM - 6:00 PM'
      }
    }
  }
})

/**
 * Converts an Earth UTC Date object to Mars Solar Date (MSD) and Coordinated Mars Time (MTC).
 *
 * @param {Date} earthDate - The Earth Date object in UTC.
 * @returns {object} An object containing msd (Mars Solar Date) and mtc (Coordinated Mars Time in hours).
 */
export function earthToMarsTime(earthDate) {
    // Constants
    const J2000_JAN_1_2000_TT_JD = 2451545.0; // Julian Date for Jan 1, 2000, 12:00 TT
    const SECONDS_PER_EARTH_DAY = 86400;
    const SECONDS_PER_MARTIAN_SOL = 88775.244; // 24 hours, 37 minutes, 22.663 seconds
    const MARTIAN_SOL_RATIO = SECONDS_PER_MARTIAN_SOL / SECONDS_PER_EARTH_DAY;

    // Julian Date (JD) calculation for the Earth date (UTC)
    const unixEpochJD = 2440587.5;
    const earthDateMilliseconds = earthDate.getTime(); // Milliseconds since Unix epoch
    const daysSinceUnixEpoch = earthDateMilliseconds / (1000 * SECONDS_PER_EARTH_DAY);
    const earthJD_UTC = unixEpochJD + daysSinceUnixEpoch;

    // For precise calculations, one would need to account for TT-UTC (Terrestrial Time - Coordinated Universal Time)
    // which involves leap seconds. For simplicity in this example, we'll use a common approximation
    // or assume TT is close enough to UTC for the purpose of demonstration.
    const TT_MINUS_UTC_SECONDS = 69.184; // As of Jan 1, 2017, for example
    const earthJD_TT = earthJD_UTC + (TT_MINUS_UTC_SECONDS / SECONDS_PER_EARTH_DAY);

    // Days since J2000 epoch (TT)
    const d_J2000_TT = earthJD_TT - J2000_JAN_1_2000_TT_JD;

    // Mars Solar Date (MSD)
    const MSD = (d_J2000_TT - 4.5) / MARTIAN_SOL_RATIO + 44796.0 - 0.00096;

    // Coordinated Mars Time (MTC)
    const MTC = (MSD % 1) * 24;

    return {
        msd: MSD,
        mtc: MTC
    };
}

export function formatMarsTime(mtc) {
    const mtcHours = Math.floor(mtc);
    const mtcMinutes = Math.floor((mtc - mtcHours) * 60);
    const mtcSeconds = Math.floor(((mtc - mtcHours) * 60 - mtcMinutes) * 60);

    return {
        hours: String(mtcHours).padStart(2, '0'),
        minutes: String(mtcMinutes).padStart(2, '0'),
        seconds: String(mtcSeconds).padStart(2, '0')
    };
}

export function getMarsSolDate(msd) {
    // MSD is the number of sols since January 6, 1997, 12:00 UTC
    // We need to find the integer part for the Sol number
    const sol = Math.floor(msd);
    return sol;
}

export function getMartianYear(msd) {
    // Mars Year 1 began on April 11, 1955 (Earth date)
    // The Julian Date for Mars Year 1, beginning of the year (MY1, 0 Ls) is approximately 2435229.5
    // This corresponds to MSD 44796.0 - 0.00096 (from earthToMarsTime) + 4.5 (offset) = 44800.49904
    // A Martian year is approximately 668.6 Sols

    // MSD of the start of Mars Year 1 (MY1, Ls=0)
    const MY1_MSD_START = 44796.0 - 0.00096 + 4.5; // This is a simplified approximation

    // Sols since the start of MY1
    const solsSinceMY1 = msd - MY1_MSD_START;

    // Martian year length in Sols
    const solsPerMartianYear = 668.6;

    // Calculate Martian Year
    const martianYear = Math.floor(solsSinceMY1 / solsPerMartianYear) + 1; // Add 1 because MY1 is the first year

    return martianYear;
}
/**
 * Timestamps must conform to the RFC3339 profile of ISO 8601,
 * with the further restrictions that an uppercase T must separate the date and time portions,
 * and an uppercase Z must denote that a numeric time zone offset is not present,
 * for example, 2016-08-18T17:33:00Z.
 */
const regex = /^(?<fullyear>\d{4})-(?<month>0[1-9]|1[0-2])-(?<mday>0[1-9]|[12][0-9]|3[01])T(?<hour>[01][0-9]|2[0-3]):(?<minute>[0-5][0-9]):(?<second>[0-5][0-9]|60)(?<secfrac>\.[0-9]+)?(Z|(\+|-)(?<offset_hour>[01][0-9]|2[0-3]):(?<offset_minute>[0-5][0-9]))$/i;

export function validateTimestamp(timestamp: string): void {
  const isValidDate: boolean = timestamp.match(regex) !== null;

  if (!isValidDate) {
    throw new Error('');
  }
}

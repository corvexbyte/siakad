import type { DayOfWeek, ScheduleSlot } from "@/types/academic";

const DAY_ORDER: DayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function slotsOverlap(a: ScheduleSlot, b: ScheduleSlot): boolean {
  if (a.dayOfWeek !== b.dayOfWeek) return false;
  const aStart = timeToMinutes(a.startTime);
  const aEnd = timeToMinutes(a.endTime);
  const bStart = timeToMinutes(b.startTime);
  const bEnd = timeToMinutes(b.endTime);
  return aStart < bEnd && bStart < aEnd;
}

export function hasScheduleConflict(
  existing: ScheduleSlot[],
  candidate: ScheduleSlot,
): boolean {
  return existing.some((slot) => slotsOverlap(slot, candidate));
}

export function findConflicts(slots: ScheduleSlot[]): string[] {
  const conflicts: string[] = [];
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      if (slotsOverlap(slots[i], slots[j])) {
        conflicts.push(
          `Bentrok: ${slots[i].dayOfWeek} ${slots[i].startTime}-${slots[i].endTime} dengan ${slots[j].dayOfWeek} ${slots[j].startTime}-${slots[j].endTime}`,
        );
      }
    }
  }
  return conflicts;
}

export function sortByDay(slots: ScheduleSlot[]): ScheduleSlot[] {
  return [...slots].sort(
    (a, b) =>
      DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek) ||
      timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
  );
}

export function checkRoomConflict(
  schedules: Array<ScheduleSlot & { roomId: string }>,
  candidate: ScheduleSlot & { roomId: string },
): boolean {
  return schedules.some(
    (s) =>
      s.roomId === candidate.roomId &&
      s.dayOfWeek === candidate.dayOfWeek &&
      slotsOverlap(s, candidate),
  );
}

export function checkLecturerConflict(
  schedules: ScheduleSlot[],
  candidate: ScheduleSlot,
): boolean {
  return hasScheduleConflict(schedules, candidate);
}

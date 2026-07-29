const EXPERIENCE_LEVELS = new Set(['entry', 'intermediate', 'expert']);
const AVAILABILITY_TYPES = new Set(['full-time', 'part-time', 'as-needed']);

const finiteNumber = (value, fallback = 0) => {
    const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value ?? '').match(/\d+(?:\.\d+)?/)?.[0]);
    return Number.isFinite(parsed) ? parsed : fallback;
};

export const normalizeExperienceLevel = (value, experienceYears = 0) => {
    const normalized = String(value || '').trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
    if (['entry', 'entry level', 'beginner'].includes(normalized)) return 'entry';
    if (normalized === 'intermediate') return 'intermediate';
    if (normalized === 'expert') return 'expert';
    const years = finiteNumber(experienceYears);
    if (years >= 6) return 'expert';
    if (years >= 3) return 'intermediate';
    return 'entry';
};

export const normalizeAvailabilityType = (value, availableHoursPerWeek = 0) => {
    const normalized = String(value || '').trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
    if (['full time', 'fulltime'].includes(normalized)) return 'full-time';
    if (['part time', 'parttime'].includes(normalized)) return 'part-time';
    if (['as needed', 'asneeded', 'hourly'].includes(normalized)) return 'as-needed';
    const hours = finiteNumber(availableHoursPerWeek);
    if (hours >= 30) return 'full-time';
    if (hours >= 1) return 'part-time';
    return 'as-needed';
};

export const normalizeFreelancerRecord = (record) => {
    const experienceYears = Math.max(0, finiteNumber(record.experienceYears, finiteNumber(record.experience)));
    const availableHoursPerWeek = Math.min(168, Math.max(0,
        finiteNumber(record.availableHoursPerWeek, finiteNumber(record.availability))
    ));
    return {
        experienceLevel: normalizeExperienceLevel(record.experienceLevel || record.experience, experienceYears),
        experienceYears,
        availabilityType: normalizeAvailabilityType(record.availabilityType || record.availability, availableHoursPerWeek),
        availableHoursPerWeek
    };
};

export const normalizeLegacyFreelancers = async (User, extraFilter = {}) => {
    const records = await User.collection.find({
        role: { $regex: /^\s*freelancer\s*$/i },
        ...extraFilter,
        $or: [
            { experience: { $exists: true } },
            { availability: { $exists: true } },
            { experienceLevel: { $nin: ['entry', 'intermediate', 'expert'] } },
            { experienceYears: { $exists: false } },
            { availabilityType: { $nin: ['full-time', 'part-time', 'as-needed'] } },
            { availableHoursPerWeek: { $exists: false } }
        ]
    }, {
        projection: {
            experience: 1,
            experienceLevel: 1,
            experienceYears: 1,
            availability: 1,
            availabilityType: 1,
            availableHoursPerWeek: 1
        }
    }).toArray();

    if (!records.length) return;
    await User.collection.bulkWrite(records.map((record) => ({
        updateOne: {
            filter: { _id: record._id },
            update: {
                $set: { role: 'freelancer', ...normalizeFreelancerRecord(record) },
                $unset: { experience: '', availability: '' }
            }
        }
    })));
};

export const isExperienceLevel = (value) => EXPERIENCE_LEVELS.has(value);
export const isAvailabilityType = (value) => AVAILABILITY_TYPES.has(value);
export const toProfileNumber = finiteNumber;

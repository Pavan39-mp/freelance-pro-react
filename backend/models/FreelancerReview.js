import mongoose from 'mongoose';

const ratingField = () => ({
    type: Number,
    required: true,
    min: 1,
    max: 5
});

const FreelancerReviewSchema = new mongoose.Schema({
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    rating: ratingField(),
    reviewText: { type: String, trim: true, default: '', maxlength: 2000 },
    communicationRating: ratingField(),
    qualityRating: ratingField(),
    deadlineRating: ratingField()
}, { timestamps: true });

FreelancerReviewSchema.index({ freelancer: 1, client: 1, project: 1 }, { unique: true });

const FreelancerReview = mongoose.model('FreelancerReview', FreelancerReviewSchema);
export default FreelancerReview;

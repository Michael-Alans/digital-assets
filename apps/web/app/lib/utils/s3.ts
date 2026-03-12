export function getS3Url(s3Key: string | undefined) {
  if (!s3Key) return null;
  const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;
  const region = process.env.NEXT_PUBLIC_AWS_REGION;
  return `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;
}
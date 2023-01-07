export const get_performance_string = (performance) => {
    return `${performance['avg_time']} seconds per question, attempted on ${performance['date']}`
}
export const matchSearch = (query, ...texts) => {
    if (!query || query.trim() === '') return true;

    const normalize = (str) => {
        if (!str) return '';
        // Convert to string and normalize to remove accents, then convert to lowercase
        return String(str)
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    };

    const qWords = normalize(query).split(/\s+/).filter(Boolean);
    const combinedText = normalize(texts.join(' '));

    // Every word in the query must be found somewhere in the combined texts
    return qWords.every(word => combinedText.includes(word));
};

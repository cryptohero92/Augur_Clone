export const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/upload`, {
        method: 'POST',
        body: formData,
    });
    const data = await response.json();
    return data.imageUrl;
}
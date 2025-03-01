
export async function sleep(mls: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, mls);
    });
}
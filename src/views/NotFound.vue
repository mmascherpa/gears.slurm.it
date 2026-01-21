<template>
    <div class="not-found-container">
        <div class="text-center">
            <v-icon icon="mdi-alert-circle" size="80" color="warning" class="mb-4"></v-icon>

            <h1 class="text-h4 text-sm-h3 font-weight-bold mb-4">Page Not Found</h1>

            <p class="text-body-1 text-medium-emphasis mb-6">
                The page you're looking for doesn't exist or may have been moved.
            </p>

            <v-btn
                to="/"
                color="primary"
                size="large"
                prepend-icon="mdi-home"
            >
                Back to Home
            </v-btn>
        </div>
    </div>
</template>

<style scoped>
.not-found-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    padding: 2rem;
}
</style>

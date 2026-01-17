
/**
 * Google Drive Module
 * Handles chunking, folder paths, and synchronization
 */

export class DriveSync {
    constructor(dbFileName = 'chunk_v3_', folderPath = '/backup/notes/', chunkSizeLimitKB = 500) {
        this.basePath = folderPath;
        this.dbPrefix = dbFileName; // Prefix for the data set
        this.chunkPrefix = 'data_part_'; // Internal prefix for chunks
        this.chunkSizeLimit = chunkSizeLimitKB * 1024;
    }

    async getOrCreateFolder(path) {
        const parts = path.split('/').filter(p => p);
        let parentId = 'root';

        for (const part of parts) {
            const q = `name = '${part}' and mimeType = 'application/vnd.google-apps.folder' and '${parentId}' in parents and trashed = false`;
            const resp = await gapi.client.drive.files.list({ q, fields: 'files(id, name)' });
            const folders = resp.result.files;

            if (folders.length > 0) {
                parentId = folders[0].id;
            } else {
                const folderMetadata = {
                    name: part,
                    mimeType: 'application/vnd.google-apps.folder',
                    parents: [parentId]
                };
                const createResp = await gapi.client.drive.files.create({
                    resource: folderMetadata,
                    fields: 'id'
                });
                parentId = createResp.result.id;
            }
        }
        return parentId;
    }

    async saveChunks(data, folderId) {
        const serialized = JSON.stringify(data);
        const chunks = [];

        console.log(`[Drive] Serialized size: ${(serialized.length / 1024).toFixed(2)} KB. Limit: ${this.chunkSizeLimit / 1024} KB`);

        for (let i = 0; i < serialized.length; i += this.chunkSizeLimit) {
            chunks.push(serialized.substring(i, i + this.chunkSizeLimit));
        }

        // 2. Clear ONLY exact chunk matches from this prefix to avoid collisions
        // also look for legacy .json files from previous version and remove them
        const q = `name contains '${this.dbPrefix}' and '${folderId}' in parents and trashed = false`;
        const existingFiles = await gapi.client.drive.files.list({ q, fields: 'files(id, name)' });

        if (existingFiles.result.files) {
            for (const file of existingFiles.result.files) {
                const isNewChunk = file.name.startsWith(this.dbPrefix + this.chunkPrefix);
                const isOldChunk = file.name.startsWith(this.dbPrefix) && file.name.endsWith('.json');

                if (isNewChunk || isOldChunk) {
                    await gapi.client.drive.files.delete({ fileId: file.id });
                }
            }
        }

        // 3. Upload new chunks with .bin to avoid GAPI auto-parsing
        for (let i = 0; i < chunks.length; i++) {
            const fileName = `${this.dbPrefix}${this.chunkPrefix}${i.toString().padStart(5, '0')}.bin`;
            await this.uploadFile(fileName, chunks[i], folderId);
        }

        return chunks.length;
    }

    async uploadFile(name, content, folderId) {
        // Search if file exists
        const q = `name = '${name}' and '${folderId}' in parents and trashed = false`;
        const resp = await gapi.client.drive.files.list({ q, fields: 'files(id)' });
        const files = resp.result.files;
        const fileId = files.length > 0 ? files[0].id : null;

        const metadata = { name, parents: fileId ? [] : [folderId] };
        const blob = new Blob([content], { type: 'application/json' });

        const accessToken = gapi.auth.getToken().access_token;
        const method = fileId ? 'PATCH' : 'POST';
        const url = fileId
            ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`
            : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`;

        if (fileId) {
            await fetch(url, {
                method,
                headers: { 'Authorization': `Bearer ${accessToken}` },
                body: blob
            });
        } else {
            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            form.append('file', blob);
            await fetch(url, {
                method,
                headers: { 'Authorization': `Bearer ${accessToken}` },
                body: form
            });
        }
    }

    async loadChunks(folderId) {
        // Find only files that match our specific chunk pattern
        const q = `name contains '${this.chunkPrefix}' and name contains '${this.dbPrefix}' and '${folderId}' in parents and trashed = false`;
        const resp = await gapi.client.drive.files.list({
            q,
            fields: 'files(id, name)',
            orderBy: 'name'
        });

        const allFiles = resp.result.files || [];
        // Filter strictly to ensure we only get chunks of the current prefix
        const files = allFiles.filter(f => f.name.startsWith(this.dbPrefix + this.chunkPrefix));

        if (files.length === 0) return null;

        console.log(`[Drive] Loading ${files.length} chunks...`);

        const accessToken = gapi.auth.getToken().access_token;
        let fullData = "";

        for (const file of files) {
            // Use fetch for alt=media to get RAW text reliably without GAPI auto-parsing
            const url = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
            const fileResp = await fetch(url, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const text = await fileResp.text();
            fullData += text;
        }

        try {
            return fullData ? JSON.parse(fullData) : null;
        } catch (e) {
            console.error('[Drive] Critical: Failed to reconstruct JSON from chunks. Length:', fullData.length);
            console.log('Partial data snippet:', fullData.substring(0, 100));
            throw e;
        }
    }
}

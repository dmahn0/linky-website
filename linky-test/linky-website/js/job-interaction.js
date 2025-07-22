// 파트너-비즈니스 작업 상호작용 모듈

// 작업 상태 업데이트 (파트너가 작업 수락)
async function acceptJob(jobId) {
    try {
        const user = auth.currentUser;
        if (!user) {
            alert('로그인이 필요합니다.');
            window.location.href = '/partners';
            return;
        }

        // 파트너 정보 가져오기
        const partnerDoc = await db.collection('users').doc(user.id).get();
        if (!partnerDoc.exists) {
            alert('파트너 정보를 찾을 수 없습니다.');
            return;
        }

        const partnerData = partnerDoc.data();

        // 작업 업데이트
        await db.collection('jobs').doc(jobId).update({
            status: 'accepted',
            partnerId: user.id,
            partnerName: partnerData.name,
            partnerPhone: partnerData.phone,
            acceptedAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert('작업을 수락했습니다. 사업주의 승인을 기다려주세요.');
        location.reload();
    } catch (error) {
        console.error('작업 수락 오류:', error);
        alert('작업 수락 중 오류가 발생했습니다.');
    }
}

// 작업 완료 처리 (파트너)
async function completeJob(jobId) {
    try {
        const user = auth.currentUser;
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        const completionNotes = prompt('완료 메모를 입력하세요 (선택사항):');

        await db.collection('jobs').doc(jobId).update({
            status: 'completed',
            completedAt: firebase.firestore.FieldValue.serverTimestamp(),
            completionNotes: completionNotes || '',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert('작업이 완료 처리되었습니다.');
        location.reload();
    } catch (error) {
        console.error('작업 완료 처리 오류:', error);
        alert('작업 완료 처리 중 오류가 발생했습니다.');
    }
}

// 파트너 승인 (사업주)
async function approvePartner(jobId) {
    try {
        const user = auth.currentUser;
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        await db.collection('jobs').doc(jobId).update({
            status: 'approved',
            approvedAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert('파트너를 승인했습니다.');
        location.reload();
    } catch (error) {
        console.error('파트너 승인 오류:', error);
        alert('파트너 승인 중 오류가 발생했습니다.');
    }
}

// 파트너 거절 (사업주)
async function rejectPartner(jobId) {
    try {
        const user = auth.currentUser;
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        const reason = prompt('거절 사유를 입력하세요:');
        if (!reason) {
            alert('거절 사유를 입력해주세요.');
            return;
        }

        await db.collection('jobs').doc(jobId).update({
            status: 'pending',
            partnerId: null,
            partnerName: null,
            partnerPhone: null,
            acceptedAt: null,
            rejectionReason: reason,
            rejectedAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert('파트너를 거절했습니다. 다른 파트너가 수락할 수 있습니다.');
        location.reload();
    } catch (error) {
        console.error('파트너 거절 오류:', error);
        alert('파트너 거절 중 오류가 발생했습니다.');
    }
}

// 작업 평가 (사업주)
async function reviewJob(jobId) {
    try {
        const user = auth.currentUser;
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        const rating = prompt('평점을 입력하세요 (1-5):');
        const review = prompt('리뷰를 입력하세요:');

        if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
            alert('올바른 평점을 입력해주세요 (1-5).');
            return;
        }

        await db.collection('jobs').doc(jobId).update({
            status: 'reviewed',
            rating: parseInt(rating),
            review: review || '',
            reviewedAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // 파트너 평점 업데이트
        const jobDoc = await db.collection('jobs').doc(jobId).get();
        const jobData = jobDoc.data();
        
        if (jobData.partnerId) {
            const partnerDoc = await db.collection('users').doc(jobData.partnerId).get();
            const partnerData = partnerDoc.data();
            
            const newRatingCount = (partnerData.ratingCount || 0) + 1;
            const newRatingSum = (partnerData.ratingSum || 0) + parseInt(rating);
            const newRatingAverage = newRatingSum / newRatingCount;
            
            await db.collection('users').doc(jobData.partnerId).update({
                ratingCount: newRatingCount,
                ratingSum: newRatingSum,
                ratingAverage: newRatingAverage,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        alert('평가가 완료되었습니다.');
        location.reload();
    } catch (error) {
        console.error('작업 평가 오류:', error);
        alert('작업 평가 중 오류가 발생했습니다.');
    }
}

// 작업 취소 (사업주)
async function cancelJob(jobId) {
    try {
        const user = auth.currentUser;
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        const reason = prompt('취소 사유를 입력하세요:');
        if (!reason) {
            alert('취소 사유를 입력해주세요.');
            return;
        }

        await db.collection('jobs').doc(jobId).update({
            status: 'cancelled',
            cancellationReason: reason,
            cancelledAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert('작업이 취소되었습니다.');
        location.reload();
    } catch (error) {
        console.error('작업 취소 오류:', error);
        alert('작업 취소 중 오류가 발생했습니다.');
    }
}

// 작업 상태에 따른 액션 버튼 생성
function getJobActionButtons(job, userType) {
    const buttons = [];
    
    if (userType === 'partner') {
        switch (job.status) {
            case 'pending':
                buttons.push(`<button class="accept-btn" onclick="acceptJob('${job.id}')">작업 수락</button>`);
                break;
            case 'approved':
                if (job.partnerId === auth.currentUser?.id) {
                    buttons.push(`<button class="complete-btn" onclick="completeJob('${job.id}')">작업 완료</button>`);
                }
                break;
        }
    } else if (userType === 'business') {
        switch (job.status) {
            case 'accepted':
                buttons.push(`<button class="approve-btn" onclick="approvePartner('${job.id}')">파트너 승인</button>`);
                buttons.push(`<button class="reject-btn" onclick="rejectPartner('${job.id}')">파트너 거절</button>`);
                break;
            case 'completed':
                buttons.push(`<button class="review-btn" onclick="reviewJob('${job.id}')">평가하기</button>`);
                break;
            case 'pending':
            case 'accepted':
                buttons.push(`<button class="cancel-btn" onclick="cancelJob('${job.id}')">작업 취소</button>`);
                break;
        }
    }
    
    return buttons.join(' ');
}

// 작업 상태 텍스트
function getJobStatusText(status) {
    const statusMap = {
        'pending': '대기중',
        'accepted': '수락됨',
        'approved': '승인됨',
        'completed': '완료됨',
        'reviewed': '평가완료',
        'cancelled': '취소됨'
    };
    return statusMap[status] || status;
}

// 작업 상태 색상
function getJobStatusColor(status) {
    const colorMap = {
        'pending': '#6b7280',
        'accepted': '#3b82f6',
        'approved': '#22c55e',
        'completed': '#a855f7',
        'reviewed': '#16a34a',
        'cancelled': '#ef4444'
    };
    return colorMap[status] || '#6b7280';
}